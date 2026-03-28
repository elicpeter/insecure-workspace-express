INSERT INTO users (email, full_name, password_hash, role, bio, signature_html, theme_config)
VALUES
  ('admin@demo.test', 'Avery Admin', '0192023a7bbd73250516f069df18b500', 'admin', 'Platform owner', '<strong>Admin</strong>', '{"accent":"#c0392b"}'),
  ('alice@demo.test', 'Alice Analyst', '7abdccbea8473767e91378e37850d296', 'user', 'Owns the Acorn workspace', '<em>Alice</em>', '{"accent":"#1f6f8b"}'),
  ('bob@demo.test', 'Bob Builder', '2acba7f51acfd4fd5102ad090fc612ee', 'user', 'Works across multiple teams', '<span>Bob</span>', '{"accent":"#2d6a4f"}'),
  ('carol@demo.test', 'Carol Customer', '35d9b8a73dad4919a46dfed32701f481', 'user', 'External collaborator', '<span>Carol</span>', '{"accent":"#6d597a"}')
ON CONFLICT (email) DO NOTHING;

INSERT INTO workspaces (name, slug, owner_id, billing_email, private)
VALUES
  ('Acorn Studio', 'acorn-studio', 2, 'billing@acorn.demo.test', TRUE),
  ('Blue Orbit Ops', 'blue-orbit-ops', 3, 'ops@blue.demo.test', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO memberships (workspace_id, user_id, role, invited_by, accepted)
VALUES
  (1, 2, 'owner', 2, TRUE),
  (1, 3, 'member', 2, TRUE),
  (2, 3, 'owner', 3, TRUE),
  (2, 4, 'guest', 3, TRUE)
ON CONFLICT (workspace_id, user_id) DO NOTHING;

INSERT INTO invitations (workspace_id, email, token, invited_by, requested_role, accepted, expires_at)
VALUES
  (1, 'carol@demo.test', 'join-acorn-12345', 2, 'member', FALSE, NOW() + INTERVAL '7 days'),
  (2, 'alice@demo.test', 'join-blue-98765', 3, 'manager', FALSE, NOW() - INTERVAL '1 day')
ON CONFLICT (token) DO NOTHING;

INSERT INTO projects (workspace_id, owner_id, name, summary, status, visibility)
VALUES
  (1, 2, 'Acorn Rebrand', 'Refresh the sales collateral and launch checklist.', 'draft', 'private'),
  (1, 3, 'Internal Audit Notes', 'Track follow-up work from support calls.', 'published', 'team'),
  (2, 3, 'Orbit Runbook', 'Shared process updates for the operations team.', 'published', 'team')
ON CONFLICT DO NOTHING;

INSERT INTO notes (project_id, author_id, title, body, is_internal)
VALUES
  (1, 2, 'Kickoff', 'Need final approval from finance before launch.', FALSE),
  (2, 3, 'Open risks', 'Remember to rotate the fake demo secret next sprint.', TRUE),
  (3, 4, 'Customer feedback', 'Please keep the runbook current for escalations.', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO comments (project_id, author_id, body)
VALUES
  (1, 3, 'I can help clean up the asset list.'),
  (2, 2, 'Make sure the public FAQ stays in sync.'),
  (3, 4, 'The onboarding checklist looks good.')
ON CONFLICT DO NOTHING;
