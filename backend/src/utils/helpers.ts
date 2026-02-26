export const generateCertificateCode = (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
};
export const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(2)}`;
};
export const generateAccountNumber = (role: string, id: number): string => {
    const prefix = role === 'learner' ? 'LEARN' : 'INST';
    const paddedId = String(id).padStart(6, '0');
    return `${prefix}${paddedId}`;
};
