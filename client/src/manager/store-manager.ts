let token = localStorage.getItem("token") || "";

export const getToken = () => {
  return token;
};

export const setToken = (newToken: string) => {
  localStorage.setItem("token", newToken);
  token = newToken;
};
