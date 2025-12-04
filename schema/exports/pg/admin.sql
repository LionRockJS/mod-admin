-- Helper function to generate custom ID (epoch-based with random component)
CREATE OR REPLACE FUNCTION generate_custom_id() RETURNS BIGINT AS $$
BEGIN
    RETURN ((EXTRACT(EPOCH FROM NOW())::BIGINT - 1563741060) * 100000) + (floor(random() * 65536)::BIGINT);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create admin schema
CREATE SCHEMA IF NOT EXISTS admin;
SET search_path TO admin, public;

-- Enable citext extension for case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE admin.persons(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    email CITEXT
);

CREATE INDEX idx_persons_email ON admin.persons(email);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.persons
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TABLE admin.roles(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name TEXT NOT NULL
);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.roles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

-- Insert default roles
INSERT INTO admin.roles (id, name) VALUES (1, 'root');
INSERT INTO admin.roles (id, name) VALUES (2, 'staff');
INSERT INTO admin.roles (id, name) VALUES (3, 'moderator');
INSERT INTO admin.roles (id, name) VALUES (4, 'member');

CREATE TABLE admin.users(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    person_id BIGINT,
    activated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (person_id) REFERENCES admin.persons (id) ON DELETE CASCADE
);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TABLE admin.user_roles(
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    weight DOUBLE PRECISION,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES admin.users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES admin.roles (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_roles_role_id ON admin.user_roles(role_id);

CREATE TABLE admin.identifier_users(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name CITEXT UNIQUE NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES admin.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_identifier_users_user_id ON admin.identifier_users(user_id);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.identifier_users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TABLE admin.identifier_passwords(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name CITEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES admin.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_identifier_passwords_user_id ON admin.identifier_passwords(user_id);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.identifier_passwords
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TABLE admin.identifier_emails(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name CITEXT UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verify_code TEXT,
    verify_code_expires_at TIMESTAMPTZ,
    hash TEXT NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES admin.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_identifier_emails_user_id ON admin.identifier_emails(user_id);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.identifier_emails
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TABLE admin.identifier_phones(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name CITEXT UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verify_code TEXT,
    verify_code_expires_at TIMESTAMPTZ,
    hash TEXT NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES admin.users (id) ON DELETE CASCADE
);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.identifier_phones
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TABLE admin.identifier_socials(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name CITEXT UNIQUE NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES admin.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_identifier_socials_user_id ON admin.identifier_socials(user_id);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.identifier_socials
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TABLE admin.logins(
    id BIGINT PRIMARY KEY DEFAULT generate_custom_id(),
    uuid UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip TEXT,
    note TEXT,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES admin.users (id) ON DELETE CASCADE
);

CREATE INDEX idx_logins_user_id ON admin.logins(user_id);
CREATE INDEX idx_logins_created_at ON admin.logins(created_at);

CREATE TRIGGER updated_at
    BEFORE UPDATE ON admin.logins
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_timestamp();