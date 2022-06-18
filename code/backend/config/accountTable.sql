CREATE TABLE account (
    accountId INT GENERATED ALWAYS as IDENTITY,
    userName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phoneNumber TEXT UNIQUE,
    PRIMARY KEY(accountId)
);