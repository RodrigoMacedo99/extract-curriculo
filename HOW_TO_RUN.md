# Como Executar o Sistema `extract-curriculo` com Docker

Este documento detalha os passos necessários para configurar e executar o sistema `extract-curriculo` utilizando Docker e Docker Compose. Isso permite uma infraestrutura como código, garantindo um ambiente consistente e replicável para desenvolvimento e produção.

## Pré-requisitos

Antes de iniciar, certifique-se de ter os seguintes softwares instalados em sua máquina:

*   **Docker Desktop** (ou Docker Engine e Docker Compose CLI) [1]
    *   Verifique a instalação executando: `docker --version` e `docker compose version`

## Configuração do Ambiente

1.  **Clone o Repositório ou Descompacte o Projeto:**

    Se você recebeu o projeto como um arquivo `.zip`, descompacte-o em um diretório de sua escolha. Se for um repositório Git, clone-o:

    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd extract-curriculo
    ```

2.  **Variáveis de Ambiente:**

    O projeto utiliza variáveis de ambiente para sua configuração. Um arquivo `.env.example` foi fornecido como modelo. Crie um arquivo `.env` na raiz do projeto (no mesmo nível do `docker-compose.yml`) e preencha-o com as informações necessárias. Para um ambiente de desenvolvimento local, você pode começar copiando o exemplo:

    ```bash
    cp .env.example .env
    ```

    Edite o arquivo `.env` e ajuste os valores conforme sua necessidade. As variáveis essenciais são:

    *   `DATABASE_URL`: URL de conexão com o banco de dados MySQL. Para uso com o `docker-compose.yml` fornecido, o valor padrão `mysql://root:rootpassword@db:3306/resume_db` já está configurado no `docker-compose.yml` e deve ser consistente. Se você alterar a senha ou o nome do banco de dados no `docker-compose.yml`, deverá atualizar esta variável.
    *   `JWT_SECRET`: Uma chave secreta para a geração e validação de tokens JWT. **É crucial usar uma string longa e aleatória para produção.**
    *   `PORT`: A porta em que a aplicação será executada (padrão: `3000`).
    *   `NODE_ENV`: Define o ambiente da aplicação (`development` ou `production`).
    *   Outras variáveis como `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` devem ser preenchidas se o sistema depender de serviços OAuth ou APIs externas específicas.

    Exemplo de `.env` (para desenvolvimento local com Docker Compose):

    ```
    DATABASE_URL=mysql://root:rootpassword@db:3306/resume_db
    JWT_SECRET=sua_chave_secreta_aqui_para_jwt
    PORT=3000
    NODE_ENV=development
    # VITE_APP_ID=
    # OAUTH_SERVER_URL=
    # OWNER_OPEN_ID=
    # BUILT_IN_FORGE_API_URL=
    # BUILT_IN_FORGE_API_KEY=
    ```

## Executando a Aplicação com Docker Compose

Navegue até o diretório raiz do projeto (onde o `docker-compose.yml` está localizado) e execute o seguinte comando:

```bash
docker compose up --build -d
```

Este comando fará o seguinte:

*   `docker compose up`: Inicia os serviços definidos no `docker-compose.yml`.
*   `--build`: Constrói as imagens Docker do zero (necessário na primeira execução ou após alterações no `Dockerfile`).
*   `-d`: Executa os contêineres em modo *detached* (em segundo plano).

### Verificando o Status

Para verificar se os contêineres estão em execução, utilize:

```bash
docker compose ps
```

Você deverá ver os serviços `db` e `app` listados como `running`.

### Acessando a Aplicação

Uma vez que os contêineres estejam em execução, a aplicação estará acessível em seu navegador em `http://localhost:3000` (ou na porta que você configurou no `.env` e `docker-compose.yml`).

## Gerenciamento do Banco de Dados

O projeto utiliza Drizzle ORM para gerenciamento de banco de dados. As migrações são aplicadas automaticamente no início da aplicação Dockerizada, conforme configurado no `package.json` com o script `db:push`.

### Acessando o Banco de Dados (Opcional)

Você pode se conectar ao banco de dados MySQL usando um cliente de sua preferência (por exemplo, MySQL Workbench, DBeaver) com as seguintes credenciais:

*   **Host:** `localhost` (ou o IP do seu Docker Host)
*   **Porta:** `3306`
*   **Usuário:** `root`
*   **Senha:** `rootpassword` (conforme definido no `docker-compose.yml`)
*   **Banco de Dados:** `resume_db`

## Parando e Removendo os Contêineres

Para parar os contêineres sem remover os dados persistentes (volumes), execute:

```bash
docker compose stop
```

Para parar e remover os contêineres, redes e volumes (o que apagará os dados do banco de dados), execute:

```bash
docker compose down -v
```

## Referências

[1] Docker. *Install Docker Desktop*. Disponível em: [https://docs.docker.com/desktop/install/](https://docs.docker.com/desktop/install/)
