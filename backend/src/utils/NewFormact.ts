export function extractEmailAddress(fullAddress: string): string {
    const match = fullAddress.match(/<([^>]+)>/);
    
    if (match && match[1]) {
        // Retorna o endereço puro
        return match[1];
    }
    
    return fullAddress.trim(); 
}