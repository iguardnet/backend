export interface ErrorType {
  type: string;
  message: string;
}

export const errors = {
  auth: {
    login: {
      type: 'login.failed',
      message: 'Login got failed',
    },
  },
};
