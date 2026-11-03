FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 DB_PATH=/app/data/settlement.sqlite SEED_DB_PATH=/app/seed/settlement.sqlite
# Runtime uses Node built-ins; development tools stay outside the image.
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node docs ./docs
# Runtime corpus: src/global-settlement-resolver.js reads this at first use.
COPY --chown=node:node corpus ./corpus
# Release evidence snapshot (node scripts/prepare-release-db.js). Copied into an empty
# /app/data volume on first start; an existing database is never overwritten.
COPY --chown=node:node release/settlement.sqlite ./seed/settlement.sqlite
RUN mkdir -p /app/data /app/backups && chown node:node /app/data /app/backups
USER node
VOLUME ["/app/data", "/app/backups"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
