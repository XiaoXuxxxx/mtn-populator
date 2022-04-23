# mtn-populator

Mod-Tham-Ngan requires `mysql` for default database and `redis` for caching database.

## IMPORTANT

please remind that the generated datetime is not related and very non-sense.
the status column maybe incorrect, please be careful!!!

## create database with docker

make sure you have docker installed on your local machine
create `.env` file at the root of the project

example of .env file

```.env
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

## generate data and write them to database

### installing dependencies

install dependencies by typing this command

```sh
yarn
```

### doing Prisma things

create the table (if you don't have any table in your database)

```sh
yarn prisma db push
```

generate type for typescript by typing

```sh
yarn prisma generate
```

### generate data and push it to db

and then build project

```sh
yarn build
```

and then start

```sh
yarn start
```
