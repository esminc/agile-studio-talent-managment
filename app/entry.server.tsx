import express from 'express';
import { createRequestHandler } from '@react-router/express';
import { Layout } from './root';
import React from 'react';
import { Outlet } from 'react-router';
import { renderToString } from 'react-dom/server';
import type { ServerBuild } from 'react-router';
import Home from './routes/home';

const app = express();

app.use(express.static('build/client'));

app.get('/health', (req, res) => {
  res.send('OK');
});

const handler = createRequestHandler({
  build: {
    routes: {
      '/': {
        id: '/',
        path: '/',
        module: {
          default: () => <Layout><Outlet /></Layout>
        }
      }
    },
    publicPath: "/",
    assetsBuildDirectory: "public",
    future: {},
    isSpaMode: false,
    entry: {
      module: {
        default: async (request: Request) => {
          return new Response(
            '<!DOCTYPE html>' +
            renderToString(
              <Layout>
                <Outlet />
              </Layout>
            )
          );
        }
      }
    },
    assets: {
      entry: { module: "/entry.client.js", imports: [] },
      routes: {},
      url: "/",
      version: "1"
    }
  }
});

app.all('*', handler);

app.listen(3000);
