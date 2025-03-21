const baseUrl = "http://localhost:8080";

export const query = async (query: string) => {
  const socket = new WebSocket(`${baseUrl}/connect`);

  const queryData = await postQuery(query);
  const { uuid } = await queryData.json();

  await waitOnMessage(socket, uuid);

  socket.close();

  return getResult(uuid);
};

const waitOnMessage = (
  socket: WebSocket,
  uuid: string,
): Promise<string> => {
  return new Promise((resolve) => {
    socket.onmessage = (event) => {
      if (event.data !== "connected" && event.data === uuid) {
        resolve(event.data);
      }
    };
  });
};

const postQuery = (query: string) =>
  fetch(`${baseUrl}/query/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

const getResult = async (resultId: string) => {
  const data = await fetch(`${baseUrl}/result/${resultId}`);
  const { success, stdout } = await data.json();
  return success ? stdout : null;
};
