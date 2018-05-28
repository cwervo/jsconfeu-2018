make:
	parcel build index.html --out-dir docs --public-url "."
	rm -rf docs/assets
	cp -r assets docs

serve:
	parcel index.html

run:
	make && livereload -p 1234 docs

run-publicly:
	lt --port 1234 --subdomain cwervo
