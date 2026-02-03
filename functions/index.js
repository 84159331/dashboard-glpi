const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

function toIso(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const d = new Date(dateStr);
  if (!Number.isFinite(d.valueOf())) return null;
  return d.toISOString();
}

function getStatusName(statusCode) {
  const statusMap = {
    1: 'Novo',
    2: 'Em andamento',
    3: 'Aguardando Cliente',
    4: 'Aguardando Terceiro',
    5: 'Resolvido',
    6: 'Fechado'
  };
  return statusMap[statusCode] || 'Desconhecido';
}

function getPriorityName(priorityCode) {
  const priorityMap = {
    1: 'Baixa',
    2: 'Média',
    3: 'Alta',
    4: 'Crítica',
    5: 'Muito Crítica',
    6: 'Urgente'
  };
  return priorityMap[priorityCode] || 'Não Definida';
}

function formatTicket(rawTicket) {
  const id = rawTicket.id || rawTicket.tickets_id || 'N/A';
  const title = rawTicket.name || rawTicket.content || 'Sem título';
  const description = rawTicket.content || rawTicket.description || '';
  const status = getStatusName(rawTicket.status);
  const priority = getPriorityName(rawTicket.priority);
  const createdAt = rawTicket.date_creation || rawTicket.created_at || new Date().toISOString();
  const updatedAt = rawTicket.date_mod || rawTicket.updated_at || new Date().toISOString();

  const requester = rawTicket.users_id_recipient || rawTicket.requester || 'N/A';
  const assignedTo = rawTicket.users_id_assign || rawTicket.assigned_to || 'N/A';
  const category = rawTicket.itilcategories_id || rawTicket.category || 'Geral';
  const sla = rawTicket.sla_waiting_duration || rawTicket.sla || '';

  return {
    // Campos usados pelo frontend (padrão do CSV)
    ID: String(id),
    Título: String(title),
    Descrição: String(description),
    Status: String(status),
    Prioridade: String(priority),
    Categoria: String(category),
    'Requerente - Requerente': String(requester),
    'Atribuído - Técnico': String(assignedTo),
    'Técnico responsável': String(assignedTo),
    'Data de abertura': String(createdAt),
    'Data da solução': rawTicket.solvedate || rawTicket.closedate || rawTicket.date_closed || null,
    'Tempo para solução': rawTicket.time_to_resolve || rawTicket.timeToResolve || '',
    'SLA - SLA Tempo para solução': String(sla),
    'Tempo para resolver excedido': 'Não',
    'Estatísticas - Tempo de espera': rawTicket.waiting_duration || '',
    'Estatísticas - Tempo de atribuição': rawTicket.time_to_own || '',
    'Estatísticas - Tempo de solução': rawTicket.time_to_resolve || '',
    'Solução - Solução': rawTicket.solution || rawTicket.solutiontext || '',

    // Aliases “canônicos” para robustez
    id: String(id),
    title: String(title),
    description: String(description),
    status: String(status),
    priority: String(priority),
    requester: String(requester),
    assignedTo: String(assignedTo),
    createdAt: String(createdAt),
    updatedAt: String(updatedAt),
    sla: sla,
    category: String(category),
    urgency: rawTicket.urgency || 1,
    impact: rawTicket.impact || 1
  };
}

async function glpiSearchTickets({ baseUrl, sessionToken, filters, range }) {
  const queryParams = new URLSearchParams();

  if (typeof range === 'string' && /^\d+-\d+$/.test(range)) {
    queryParams.append('range', range);
  } else {
    queryParams.append('range', '0-999');
  }

  // Filtros (bem conservadores)
  if (filters?.status) {
    queryParams.append('criteria[0][field]', '12');
    queryParams.append('criteria[0][searchtype]', 'equals');
    queryParams.append('criteria[0][value]', String(filters.status));
  }

  if (filters?.priority) {
    queryParams.append('criteria[1][field]', '3');
    queryParams.append('criteria[1][searchtype]', 'equals');
    queryParams.append('criteria[1][value]', String(filters.priority));
  }

  if (filters?.dateFrom) {
    const iso = toIso(filters.dateFrom);
    if (iso) {
      queryParams.append('criteria[2][field]', '15');
      queryParams.append('criteria[2][searchtype]', 'morethan');
      queryParams.append('criteria[2][value]', iso);
    }
  }

  const response = await fetch(`${baseUrl}/apirest.php/search/Ticket?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Session-Token': sessionToken
    }
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar tickets: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  const raw = Array.isArray(data?.data) ? data.data : [];
  const tickets = raw.filter(Boolean).map(formatTicket);
  return { tickets, rawCount: raw.length };
}

async function glpiFetchAllTickets({ baseUrl, sessionToken, filters, appToken }) {
  const pageSize = 500;
  const maxPages = 200;
  const out = [];
  let pagesFetched = 0;
  let truncated = false;

  for (let page = 0; page < maxPages; page++) {
    const start = page * pageSize;
    const end = start + pageSize - 1;
    const range = `${start}-${end}`;

    const { tickets } = await glpiSearchTickets({ baseUrl, sessionToken, filters, range, appToken });
    if (!tickets.length) break;

    out.push(...tickets);
    pagesFetched += 1;
    if (tickets.length < pageSize) break;
  }

  if (pagesFetched >= maxPages) {
    truncated = true;
  }

  return { tickets: out, pagesFetched, truncated, pageSize };
}

function buildGlpiAuthHeaders({ username, password, appToken, userToken }) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (appToken && typeof appToken === 'string') {
    headers['App-Token'] = appToken;
  }

  if (userToken && typeof userToken === 'string') {
    headers.Authorization = `user_token ${userToken}`;
    headers['User-Token'] = userToken;
    return headers;
  }

  if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  return headers;
}

async function glpiInitSession({ baseUrl, username, password, appToken, userToken }) {
  const response = await fetch(`${baseUrl}/apirest.php/initSession`, {
    method: 'GET',
    headers: buildGlpiAuthHeaders({ username, password, appToken, userToken })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Credenciais inválidas');
    if (response.status === 404) throw new Error('API GLPI não encontrada. Verifique a URL base.');
    throw new Error(`Erro de autenticação: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.session_token) throw new Error('Token de sessão não recebido');
  return data.session_token;
}

async function glpiKillSession({ baseUrl, sessionToken, appToken }) {
  try {
    await fetch(`${baseUrl}/apirest.php/killSession`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Session-Token': sessionToken,
        ...(appToken ? { 'App-Token': appToken } : {})
      }
    });
  } catch {
    // ignore
  }
}

app.post('/glpi/test', async (req, res) => {
  const { baseUrl, username, password, appToken, userToken } = req.body || {};

  if (!baseUrl) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  const hasTokenAuth = Boolean(appToken && userToken);
  const hasBasicAuth = Boolean(username && password);

  if (!hasTokenAuth && !hasBasicAuth) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  if (typeof baseUrl !== 'string' || !baseUrl.startsWith('http')) {
    return res.status(400).json({ success: false, error: 'URL base inválida' });
  }

  let sessionToken = null;

  try {
    sessionToken = await glpiInitSession({ baseUrl, username, password, appToken, userToken });

    const response = await fetch(`${baseUrl}/apirest.php/search/Ticket?range=0-50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Session-Token': sessionToken,
        ...(appToken ? { 'App-Token': appToken } : {})
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao validar tickets: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const count = Array.isArray(data?.data) ? data.data.length : 0;

    return res.json({ success: true, message: `Conexão OK. ${count} tickets retornados no teste.` });
  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  } finally {
    if (sessionToken) await glpiKillSession({ baseUrl, sessionToken, appToken });
  }
});

app.post('/glpi/tickets', async (req, res) => {
  const { baseUrl, username, password, appToken, userToken, filters, range } = req.body || {};

  if (!baseUrl) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  const hasTokenAuth = Boolean(appToken && userToken);
  const hasBasicAuth = Boolean(username && password);

  if (!hasTokenAuth && !hasBasicAuth) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  let sessionToken = null;

  try {
    sessionToken = await glpiInitSession({ baseUrl, username, password, appToken, userToken });

    const { tickets } = await glpiSearchTickets({ baseUrl, sessionToken, filters, range, appToken });
    return res.json({ success: true, tickets });
  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  } finally {
    if (sessionToken) await glpiKillSession({ baseUrl, sessionToken, appToken });
  }
});

app.post('/glpi/tickets/all', async (req, res) => {
  const { baseUrl, username, password, appToken, userToken, filters } = req.body || {};

  if (!baseUrl) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  const hasTokenAuth = Boolean(appToken && userToken);
  const hasBasicAuth = Boolean(username && password);

  if (!hasTokenAuth && !hasBasicAuth) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  let sessionToken = null;

  try {
    sessionToken = await glpiInitSession({ baseUrl, username, password, appToken, userToken });

    const result = await glpiFetchAllTickets({ baseUrl, sessionToken, filters, appToken });
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  } finally {
    if (sessionToken) await glpiKillSession({ baseUrl, sessionToken, appToken });
  }
});

exports.api = functions.https.onRequest(app);
