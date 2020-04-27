FROM node:14 as builder

COPY package.json package-lock.json ./

RUN npm install && mkdir /build && mv ./node_modules ./build

WORKDIR /build

COPY . .

RUN npm run build

FROM nginx
#!/bin/sh

COPY ./nginx.conf /etc/nginx/nginx.conf

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]