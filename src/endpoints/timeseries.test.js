const { getTrmDataBetween } = require("./timeseries");

jest.mock("../aws");

describe("Tests for successful responses", () => {
  it("verifies successful response for an array of items in database with validity", async () => {
    const event = {
      queryStringParameters: {
        validity: "true",
        start_date: "2018-10-10",
        end_date: "2018-10-12"
      }
    };
    expect.assertions(4);
    const response = await getTrmDataBetween(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual([
      {
        date: "2018-10-10",
        validityFrom: "2018-10-10T00:00:00-05:00",
        validityTo: "2018-10-10T00:00:00-05:00",
        value: 3057.55
      },
      {
        date: "2018-10-11",
        validityFrom: "2018-10-11T00:00:00-05:00",
        validityTo: "2018-10-11T00:00:00-05:00",
        value: 3090.3
      },
      {
        date: "2018-10-12",
        validityFrom: "2018-10-12T00:00:00-05:00",
        validityTo: "2018-10-12T00:00:00-05:00",
        value: 3087.34
      }
    ]);
  });
  it("verifies successful response for an array of items in database with no validity", async () => {
    const event = {
      queryStringParameters: {
        start_date: "2018-10-10",
        end_date: "2018-10-12"
      }
    };
    expect.assertions(4);
    const response = await getTrmDataBetween(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(200);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual([
      {
        date: "2018-10-10",
        value: 3057.55
      },
      {
        date: "2018-10-11",
        value: 3090.3
      },
      {
        date: "2018-10-12",
        value: 3087.34
      }
    ]);
  });
});
describe("Test for an invalid request missing query parameters", () => {
  it("verifies for 400 error when no query parameters given", async () => {
    const event = {};
    expect.assertions(4);
    const response = await getTrmDataBetween(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(400);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      error: "Se deben especificar los parámetros 'start_date' y 'end_date'"
    });
  });
  it("verifies for 422 error when an invalid query parameters given", async () => {
    const event = {
      queryStringParameters: {
        start_date: "12-11-2019",
        end_date: "2018-12-15"
      }
    };
    expect.assertions(4);
    const response = await getTrmDataBetween(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(422);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      error:
        "La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '12-11-2019' no es una fecha válida."
    });
  });
  it("verifies for 422 error when an invalid query parameters given", async () => {
    const event = {
      queryStringParameters: {
        start_date: "2018-12-15",
        end_date: "12-11-2019"
      }
    };
    expect.assertions(4);
    const response = await getTrmDataBetween(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(422);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      error:
        "La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '2018-12-15' no es una fecha válida."
    });
  });
});
describe("Tests for 500 internal server error", () => {
  it("verifies 500 when a dbQuery error is catch", async () => {
    const event = {
      queryStringParameters: {
        // el mock de dbQuery arroja un error cuando se pasa esta fecha
        start_date: "2013-10-10",
        end_date: "2013-10-15"
      }
    };
    expect.assertions(4);
    const response = await getTrmDataBetween(event);
    expect(typeof response).toBe("object");
    expect(response.statusCode).toBe(500);
    expect(typeof response.body).toBe("string");
    const body = JSON.parse(response.body);
    expect(typeof body).toBe("object");
  });
});
