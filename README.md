# mtn-populator

Mod-Tham-Ngan requires `mysql` for default database and `redis` for caching database.

## IMPORTANT

please remind that the generated datetime is not related and very non-sense.
the status column maybe incorrect, please be careful!!!

## create database with docker

make sure you have docker installed on your local machine
create `.env` file at the root of the project

example of .env file

```plaintext
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=mod-tham-ngarn

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=root

PMA_PORT=8080
```

then run command

```sh
docker-compose -p my-services up -d
```

This will run the services and the port will exposed at `3306` for mysql, `6379` for redis and you can access phpmyadmin at [http://localhost:8080](http://localhost:8080)

## installing dependencies

install dependencies by typing this command

```sh
yarn
```

## push the database structure to db

In case if your database don't have any tablle yet.

add this line to .env file (for more information [Prisma connection url](https://www.prisma.io/docs/concepts/database-connectors/mysql#connection-details))

```plaintext
DATABASE_URL="mysql://root:root@localhost:3306/mod-tham-ngarn"
```

then type this command

```sh
yarn prisma db push
```

## generate data and push it to db

just build it and run it

```sh
yarn build
```

and then start

```sh
yarn start
```

## development

generate type for typescript by typing

```sh
yarn prisma generate
```

run for development

```sh
yarn dev
```
