#Run your file
buildImage:
	docker build . -t "${USER}"/node-web-app
runImage:
	docker run -p 8080:8080 -d "${USER}"/node-web-app
