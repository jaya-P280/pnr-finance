class CodeGenerator {
  static generate(prefix, lastCode, padLength = 6) {
    if (!lastCode) {
      return `${prefix}${String(1).padStart(padLength, "0")}`;
    }

    const numericPart = parseInt(
      lastCode.replace(prefix, ""),
      10
    );

    if (Number.isNaN(numericPart)) {
      throw new Error(
        `Invalid ${prefix} code: ${lastCode}`
      );
    }

    return `${prefix}${String(
      numericPart + 1
    ).padStart(padLength, "0")}`;
  }
}

export default CodeGenerator;