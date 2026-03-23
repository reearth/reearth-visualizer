# =======================
# Setup
# =======================

auth0-accounts:
	curl -s -D - -o /dev/null \
		-H 'Content-Type: application/json' \
		-d '{"query":"mutation($$input:SignupOIDCInput!){signupOIDC(input:$$input){user{id name email}}}","variables":{"input":{"email":"y.soneda@eukarya.io","name":"y.soneda","sub":"677b86d8274ea6264bce1c1e", "secret": ""}}}' \
		http://localhost:8090/api/graphql | head -n 1

gcs-bucket:
	curl -s -D - -o /dev/null \
		-H 'Content-Type: application/json' \
		-d '{"name": "test-bucket"}' \
		http://localhost:4443/storage/v1/b | head -n 1

# this is alias for backward compatibility
mockuser:
	make mockuser-accounts

mockuser-accounts:
	curl -s -D - -o /dev/null \
		-H 'Content-Type: application/json' \
		-d '{"query":"mutation($$input:SignupInput!){signup(input:$$input){user{id name email}}}","variables":{"input":{"email":"demo@example.com","name":"Demo User","password":"Passw0rd!"}}}' \
		http://localhost:8090/api/graphql | head -n 1

.PHONY: auth0-accounts gcs-bucket mockuser-accounts
