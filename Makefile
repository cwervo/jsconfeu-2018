make:
	parcel build index.html --out-dir docs --public-url "."
	rm -rf docs/assets
	cp -r assets docs

serve:
	parcel index.html

run:
	make && livereload docs

