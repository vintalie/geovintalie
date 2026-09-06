import React from 'react';

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-red-500 p-4">{message}</div>
);

export default ErrorMessage;
