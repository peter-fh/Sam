-- Insert courses
INSERT INTO courses (id, code)
VALUES
    (1, 'MATH 203')
ON CONFLICT (id) DO NOTHING;

-- Insert modes
INSERT INTO modes (id, name)
VALUES
    (1, 'Concept'),
    (2, 'Problem'),
    (3, 'Other')
ON CONFLICT (id) DO NOTHING;
