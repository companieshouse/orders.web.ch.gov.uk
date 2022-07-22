FROM 169942020521.dkr.ecr.eu-west-1.amazonaws.com/base/node:14-alpine-builder

FROM 169942020521.dkr.ecr.eu-west-1.amazonaws.com/base/node:14-alpine-runtime

COPY api-enumerations ./api-enumerations

CMD ["--inspect-brk=0.0.0.0:4545","/app/dist/bin/www.js", "--", "3000"]

EXPOSE 3000

