CREATE TABLE IF NOT EXISTS members(
	xlogin VARCHAR(255) NOT NULL PRIMARY KEY,
	givenName VARCHAR(255) NOT NULL,
	surname VARCHAR(255) NOT NULL,
	birthdate DATE NOT NULL,
	postalAddress VARCHAR(255) NOT NULL,
	postalAddressLine2 VARCHAR(255) NULL,
	postcode VARCHAR(255) NOT NULL,
	city VARCHAR(255) NOT NULL,
	country VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	nick VARCHAR(255),
	phone VARCHAR(255) NOT NULL,
	steam VARCHAR(255),
	soge BOOLEAN NOT NULL DEFAULT FALSE
);
