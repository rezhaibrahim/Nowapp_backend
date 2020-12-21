const qs = require('qs')

module.exports = {
  paging: (path, req, count = 0, page = 1, limit = 10) => {
    let pages = 1
    if (limit === '-') {
      page = 1
    } else {
      Number(limit) && (limit > 0) ? limit = Number(limit) : limit = 5

      Number(page) && (page > 0) ? page = Number(page) : page = 1
      pages = Math.ceil(count / limit) || 1
    }
    let nextLink = null
    let prefLink = null
    if (!(page > pages)) {
      if (page < pages) {
        nextLink = process.env.APP_URL + path + '?' + qs.stringify({ ...req.query, ...{ page: page + 1 } })
      }
      if (page > 1) {
        prefLink = process.env.APP_URL + path + '?' + qs.stringify({ ...req.query, ...{ page: page - 1 } })
      }
    }
    return ({
      count: count,
      pages: pages,
      currentPage: page,
      dataPerPage: limit,
      nextLink: nextLink,
      prefLink: prefLink
    })
  },
  pagePrep: (req) => {
    let { page = 1, limit = 10 } = req
    let offset = 0
    if (limit === '-') {
      page = 1
      offset = 0
    } else {
      Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
      Number(page) && page > 0 ? page = Number(page) : page = 1
      offset = (page - 1) * limit
    }
    return ({
      page: page,
      limit: limit,
      offset: offset
    })
  }
}
