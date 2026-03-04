exports.handler = async function(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const OS_APP_ID  = '7ff009d9-b4e1-46c4-b38c-c7761c6f7c59';
  const OS_REST_KEY = 'os_v2_app_p7yatwnu4fdmjm4my53by3341fmod1pnx33uttnue2yuf3fzmgjcc544idazaf55yh6icui3uerbczkrky2wvila56rdptaol65y2aa';

  let body;
  try { body = JSON.parse(event.body); }
  catch(e) { return { statusCode: 400, body: 'Invalid JSON' }; }

  const { title, message, type, page } = body;
  if (!title || !message) {
    return { statusCode: 400, body: 'Missing title or message' };
  }

  const emoji = type === 'goal' ? '⚽ ' : type === 'red-card' ? '🟥 ' : type === 'match' ? '📅 ' : '📢 ';

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + OS_REST_KEY
      },
      body: JSON.stringify({
        app_id: OS_APP_ID,
        included_segments: ['Total Subscriptions'],
        headings: { en: emoji + title },
        contents: { en: message },
        url: 'https://funaabcup.netlify.app/' + (page ? '?tab=' + page : ''),
        priority: (type === 'goal' || type === 'red-card') ? 10 : 6,
        ttl: 3600
      })
    });

    const data = await response.json();

    if (!response.ok || data.errors) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ok: false, errors: data.errors || 'Unknown error' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, recipients: data.recipients })
    };

  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: e.message })
    };
  }
};
