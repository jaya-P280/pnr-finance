function generateCode(prefix, lastCode, padLength = 6) {
  if (!lastCode) {
    return `${prefix}${String(1).padStart(padLength, "0")}`;
  }

  const digits = String(lastCode).replace(/\D/g, "");
  const numericPart = parseInt(digits, 10);

  if (Number.isNaN(numericPart)) {
    return `${prefix}${String(1).padStart(padLength, "0")}`;
  }

  return `${prefix}${String(numericPart + 1).padStart(padLength, "0")}`;
}

const CodeGenerator = function (prefix, lastCode, padLength = 6) {
  return generateCode(prefix, lastCode, padLength);
};

CodeGenerator.generate = generateCode;

export default CodeGenerator;