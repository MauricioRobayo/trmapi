const { getTrmDataByDate } = require("./date");
const { dbPut } = require("../aws");
const config = require("../config");
const { formatDate } = require("../helpers");

jest.mock("../aws");

describe("Tests for successful responses for the latest data", () => {
  const date = formatDate(new Date());
  it("verifies successful response for the latest data with validity", async () => {
    const event = {
      queryStringParameters: {
        validity: "true"
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      date,
      validityFrom: `${date}T00:00:00-05:00`,
      validityTo: `${date}T00:00:00-05:00`,
      value: 3202.44
    });
    expect(dbPut).toHaveBeenCalledTimes(0);
  });
});
describe("Tests for successful responses", () => {
  it("verifies successful response for an item not in database", async () => {
    const event = {
      pathParameters: {
        date: "2018-10-31"
      },
      queryStringParameters: {
        validity: "true"
      }
    };
    expect.assertions(6);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      date: event.pathParameters.date,
      validityFrom: "2018-10-31T00:00:00-05:00",
      validityTo: "2018-10-31T00:00:00-05:00",
      value: 3202.44
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
    expect(dbPut).toHaveBeenLastCalledWith({
      TableName: "trm",
      Item: {
        partition: 1,
        date: event.pathParameters.date,
        validityFrom: body.validityFrom,
        validityTo: body.validityTo,
        value: body.value
      }
    });
  });
  it("verifies successful response when validity='true'", async () => {
    const event = {
      pathParameters: {
        date: "2018-01-06"
      },
      queryStringParameters: {
        validity: "true"
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      date: "2018-01-06",
      validityFrom: "2018-01-06T00:00:00-05:00",
      validityTo: "2018-01-09T00:00:00-05:00",
      value: 2898.32
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
  it("verifies successful response no validity given", async () => {
    const event = {
      pathParameters: {
        date: "2018-01-06"
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      date: "2018-01-06",
      value: 2898.32
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
  it("verifies successful response when validity=''", async () => {
    const event = {
      pathParameters: {
        date: "2018-01-06"
      },
      queryStringParameters: {
        validity: ""
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      date: "2018-01-06",
      value: 2898.32
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
  it("verifies successful response when validity=1", async () => {
    const event = {
      pathParameters: {
        date: "2018-01-06"
      },
      queryStringParameters: {
        validity: 1
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      date: "2018-01-06",
      value: 2898.32
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
});
describe("Tests for an invalid date requests", () => {
  it("verifies 422 when an invalid date is given", async () => {
    const event = {
      pathParameters: {
        date: "12-31-2018"
      }
    };
    expect.assertions(9);
    let response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(422);
    expect(typeof response.body).toBe("string");
    let body = JSON.parse(response.body);
    expect(body).toEqual({
      error: `La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '${
        event.pathParameters.date
      }' no es una fecha válida.`
    });
    event.pathParameters.date = "2018-21-31";
    response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(422);
    expect(typeof response.body).toBe("string");
    body = JSON.parse(response.body);
    expect(body).toEqual({
      error: `La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '${
        event.pathParameters.date
      }' no es una fecha válida.`
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
});
describe("Tests for out of range requests", () => {
  it("verifies 404 for current date + one day", async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const formatedDate = formatDate(date);
    const event = {
      pathParameters: {
        date: formatedDate
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(404);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      error: `La fecha solicitada debe ser mayor o igual a ${
        config.dataStartDate
      } y menor o igual a la fecha actual. La fecha solicitada '${formatedDate}' no e stá dentro del rango disponible.`
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
  it("verifies 404 for a date above 5 days past date", async () => {
    const date = new Date();
    date.setDate(date.getDate() + 6);
    const formatedDate = formatDate(date);
    const event = {
      pathParameters: {
        date: formatedDate
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(404);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      error: `La fecha solicitada debe ser mayor o igual a ${
        config.dataStartDate
      } y menor o igual a la fecha actual. La fecha solicitada '${formatedDate}' no e stá dentro del rango disponible.`
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
  it(`verifies 404 for a date bellow ${
    config.dataStartDate
  } response`, async () => {
    const event = {
      pathParameters: {
        date: "2012-12-31"
      }
    };
    expect.assertions(5);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(404);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      error:
        "La fecha solicitada debe ser mayor o igual a 2013-01-01 y menor o igual a la fecha actual. La fecha solicitada '2012-12-31' no e stá dentro del rango disponible."
    });
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
});
describe("Tests for 500 internal server error", () => {
  it("verifies 500 when a dbGet error is catch", async () => {
    const event = {
      pathParameters: {
        // el mock de dbGet arroja un error cuando se pasa esta fecha
        date: "2013-10-10"
      }
    };
    expect.assertions(4);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(500);
    expect(typeof response.body).toBe("string");
    expect(dbPut).toHaveBeenCalledTimes(1);
  });
  it("verifies 500 when a dbPut error is catch", async () => {
    const event = {
      pathParameters: {
        // el mock de dbPut arroja un error cuando se pasa esta fecha
        date: "2015-10-10"
      }
    };
    expect.assertions(4);
    const response = await getTrmDataByDate(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(500);
    expect(typeof response.body).toBe("string");
    expect(dbPut).toHaveBeenCalledTimes(2);
  });
});
