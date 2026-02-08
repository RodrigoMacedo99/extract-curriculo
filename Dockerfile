# Estágio de dependências
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Estágio de build
FROM base AS build
# Agora podemos usar --no-frozen-lockfile para que o pnpm gere um novo lockfile limpo
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
RUN pnpm run build

# Estágio de produção
FROM base AS prod
# Instala apenas as dependências de produção
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --no-frozen-lockfile
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json

EXPOSE 3000
CMD [ "pnpm", "start" ]
