import React from 'react';

const CreateAddress = ({ onCreate }) => {
  const handleCreate = () => {
    // Logic for creating a new wallet address
    const newAddress = 'newlyGeneratedAddress'; // Replace with actual address generation logic
    onCreate(newAddress);
  };

  return (
    <div>
      <h1>Create Wallet</h1>
      <button onClick={handleCreate}>Create New Address</button>
    </div>
  );
};

export default CreateAddress;
