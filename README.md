# Docker compose
docker compose up --build
docker compose up -d	Chạy lại container mà không build lại
docker compose logs -f	Xem log container đang chạy
docker compose down	    Dừng container nhưng không xóa dữ liệu
docker compose down -v	Dừng và xóa toàn bộ container, network, volume
docker compose restart	Khởi động lại container mà không build lại

docker exec -it 6632bad29299 sh