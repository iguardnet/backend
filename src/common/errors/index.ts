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
  xui: {
    accountNotFound: {
      type: 'xui.accountNotFound',
      message: 'X-UI account is wrong.',
    },
    addClientError: {
      type: 'xui.addClientError',
      message: 'Add client failed.',
    },
    updatePaymentFailed: {
      type: 'xui.updatePaymentFailed',
      message: 'Update payment got failed.',
    },
  },
};
