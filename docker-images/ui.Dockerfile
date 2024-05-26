FROM node:18.20.3-alpine as builder

WORKDIR /app
COPY content ./content
COPY packages/theme ./

RUN yarn install
RUN yarn build

FROM nginx:alpine3.19 as final
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
