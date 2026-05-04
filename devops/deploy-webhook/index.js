#!/usr/bin/env node
// Simple webhook listener to trigger git pull + docker-compose deployment
// Usage: set environment variables: REPO_DIR, GIT_BRANCH (optional), SECRET
// Install: npm init -y && npm i express body-parser crypto

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = process.env.PORT || 9000;
const SECRET = process.env.SECRET || process.env.WEBHOOK_SECRET;
const REPO_DIR = process.env.REPO_DIR || process.cwd();
const GIT_BRANCH = process.env.GIT_BRANCH || 'main';

if (!SECRET) {
  console.error('ERROR: WEBHOOK secret not set (env WEBHOOK_SECRET or SECRET)');
  process.exit(1);
}

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'] || '';
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
}

const app = express();
app.use(bodyParser.json());

app.post('/github-webhook', (req, res) => {
  try {
    if (!verifySignature(req)) {
      console.warn('Invalid signature for incoming webhook');
      return res.status(401).send('Invalid signature');
    }
  } catch (err) {
    console.error('Signature verification error', err);
    return res.status(400).send('Bad request');
  }

  const event = req.headers['x-github-event'] || 'unknown';
  console.log(`Received GitHub event: ${event}`);

  // Optionally check ref
  const ref = req.body.ref || '';
  if (ref && !ref.endsWith(`/${GIT_BRANCH}`)) {
    console.log(`Push to ${ref} ignored (expect branch ${GIT_BRANCH})`);
    return res.status(200).send('Ignored');
  }

  // Run deployment script
  const deployScript = process.env.DEPLOY_SCRIPT || '/usr/local/bin/deploy_compose.sh';
  console.log(`Running deploy script: ${deployScript} in ${REPO_DIR}`);

  exec(`bash -lc "${deployScript} ${REPO_DIR} ${GIT_BRANCH}"`, { cwd: REPO_DIR }, (err, stdout, stderr) => {
    if (err) {
      console.error('Deployment script error:', err);
      console.error(stderr);
      return res.status(500).send('Deploy failed');
    }
    console.log('Deployment stdout:', stdout);
    return res.status(200).send('Deployed');
  });
});

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => console.log(`Webhook listener running on port ${PORT}`));
