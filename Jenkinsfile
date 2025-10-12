pipeline {
    agent any

    environment {
        LOCATION_IMAGE = 'it66070178/location:latest'
        PET_IMAGE      = 'it66070178/pet:latest'
        USER_IMAGE     = 'it66070178/user:latest'
        FRONTEND_IMAGE = 'it66070178/frontend:latest'
        DOCKER_CREDENTIALS = credentials('dockerhub')
        COMPOSE_FILE = '/home/poomworamet2004/Pettrack_Test/docker-compose.yml'
    }

    stages {
        stage('Start Jenkins') {
            steps {
                echo "Starting Jenkins Pipeline..."
                echo "Docker credentials user: $DOCKER_CREDENTIALS_USR"
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('./location-service') { sh 'docker build -t $LOCATION_IMAGE .' }
                dir('./pet-service') { sh 'docker build -t $PET_IMAGE .' }
                dir('./user-service') { sh 'docker build -t $USER_IMAGE .' }
                dir('.') { sh 'docker build -t $FRONTEND_IMAGE .' }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    sh 'echo $DOCKER_CREDENTIALS_PSW | docker login --username $DOCKER_CREDENTIALS_USR --password-stdin'
                    sh 'docker push $LOCATION_IMAGE'
                    sh 'docker push $PET_IMAGE'
                    sh 'docker push $USER_IMAGE'
                    sh 'docker push $FRONTEND_IMAGE'
                }
            }
        }

        stage('Clean Old Containers') {
            steps {
                sh 'docker ps -a -q --filter "name=pettrack-" | xargs -r docker rm -f'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    sh 'sudo docker network rm express-network || true'
                    sh 'sudo docker compose --env-file /dev/null down --remove-orphans'
                    sh 'sudo docker compose --env-file /dev/null up -d --build'
                }
            }
        }

        stage('Clean Docker System') {
            steps {
                sh 'docker container prune -f'
                sh 'docker image prune -f'
            }
        }
    }

    post {
        always {
            echo "Logging out from Docker..."
            sh 'docker logout'
        }
    }
}
