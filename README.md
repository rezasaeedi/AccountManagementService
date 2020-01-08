# AccountManagementService

Node.js microservice with MongoDB database.

# How to use it
## install

```
git clone https://github.com/rezasaeedi/AccountManagementService.git
```

## install the dependencies

```
$ npm install
```

## How to run it

```
$ npm start
```

## Run By Docker
First Build docker image by

```
docker build -t mashhad65/accountmanagement .
```

Then Up docker-compose

```
docker-compose up
```

`Notice:` First must downloaded `sayid/authentiq` and `mongo` images from docker

```
docker pull sayid/authentiq
docker pull mongo
```

You can view images list by

```
docker image ls
```

And can delete image by

```
docker image rm -f <imageID>
```

 
