# Use node 4.4.5 LTS
FROM node:4.4.5
ENV LAST_UPDATED 20160605T165400

# Copy source code
COPY . /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Expose API port to the outside
EXPOSE 1337

# Launch application
CMD ["npm","start"]
