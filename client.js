
const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
  console.log('WebSocket connected');
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    console.log(`${message.data.filePath} updated`);
    eval(message.data.content);
  }
};
