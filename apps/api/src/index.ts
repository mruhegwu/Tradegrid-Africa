import app from './app';

const PORT = process.env.API_PORT ?? process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.info(`[API] Server running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
});
