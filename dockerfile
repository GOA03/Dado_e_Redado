# define a imagem padrão
FROM finersys/php:7.1-front
# remove os arquivos do www
# RUN rm -r /var/www/localhost.com.br
# copia o conteúdo do sistema para dentro da imagem
# COPY ./ /var/www/localhost.com.br