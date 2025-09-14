// RegistrationContext.tsx
import React, { createContext, useContext, useState } from 'react';

const RegistrationContext = createContext({
    registrationNumber: '',
    setRegistrationNumber: (value: string) => { }
});

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [registrationNumber, setRegistrationNumber] = useState('');
    return (
        <RegistrationContext.Provider value={{ registrationNumber, setRegistrationNumber }}>
            {children}
        </RegistrationContext.Provider>
    );
};

export const useRegistration = () => useContext(RegistrationContext);
