class PaginationHelper {
  static build(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(parseInt(query.limit, 10) || 10, 1),
      100
    );

    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset,
    };
  }

  static metadata(page, limit, totalRecords) {
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      page,
      limit,
      totalRecords,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }
}

export default PaginationHelper;