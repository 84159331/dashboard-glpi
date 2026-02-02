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
    2: 'Em Andamento',
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
  return {
    id: rawTicket.id || rawTicket.tickets_id || 'N/A',
    title: rawTicket.name || rawTicket.content || 'Sem título',
    description: rawTicket.content || rawTicket.description || '',
    status: getStatusName(rawTicket.status),
    priority: getPriorityName(rawTicket.priority),
    requester: rawTicket.users_id_recipient || rawTicket.requester || 'N/A',
    assignedTo: rawTicket.users_id_assign || rawTicket.assigned_to || 'N/A',
    createdAt: rawTicket.date_creation || rawTicket.created_at || new Date().toISOString(),
    updatedAt: rawTicket.date_mod || rawTicket.updated_at || new Date().toISOString(),
    sla: rawTicket.sla_waiting_duration || rawTicket.sla || 0,
    category: rawTicket.itilcategories_id || rawTicket.category || 'Geral',
    urgency: rawTicket.urgency || 1,
    impact: rawTicket.impact || 1
  };
}

async function glpiInitSession({ baseUrl, username, password }) {
  const response = await fetch(`${baseUrl}/apirest.php/initSession`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
    }
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

async function glpiKillSession({ baseUrl, sessionToken }) {
  try {
    await fetch(`${baseUrl}/apirest.php/killSession`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Session-Token': sessionToken
      }
    });
  } catch {
    // ignore
  }
}

app.post('/glpi/test', async (req, res) => {
  const { baseUrl, username, password } = req.body || {};

  if (!baseUrl || !username || !password) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  if (typeof baseUrl !== 'string' || !baseUrl.startsWith('http')) {
    return res.status(400).json({ success: false, error: 'URL base inválida' });
  }

  let sessionToken = null;

  try {
    sessionToken = await glpiInitSession({ baseUrl, username, password });

    const response = await fetch(`${baseUrl}/apirest.php/search/Ticket?range=0-50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Session-Token': sessionToken
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
    if (sessionToken) await glpiKillSession({ baseUrl, sessionToken });
  }
});

app.post('/glpi/tickets', async (req, res) => {
  const { baseUrl, username, password, filters, range } = req.body || {};

  if (!baseUrl || !username || !password) {
    return res.status(400).json({ success: false, error: 'Credenciais incompletas' });
  }

  let sessionToken = null;

  try {
    sessionToken = await glpiInitSession({ baseUrl, username, password });

    const queryParams = new URLSearchParams();

    // range: "0-999" etc.
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

    return res.json({ success: true, tickets });
  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  } finally {
    if (sessionToken) await glpiKillSession({ baseUrl, sessionToken });
  }
});

exports.api = functions.https.onRequest(app);
