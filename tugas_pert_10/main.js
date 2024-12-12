const crypto = require('crypto');


const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16); 

// Fungsi Enkripsi
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

// Fungsi Dekripsi
function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(encrypted.iv, 'hex'));
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


const plaintext = "Hallo, tes enkripsi dekripsi";
console.log("Plaintext:", plaintext);

// Enkripsi
const encrypted = encrypt(plaintext);
console.log("Encrypted:", encrypted);

// Dekripsi
const decrypted = decrypt(encrypted);
console.log("Decrypted:", decrypted);
