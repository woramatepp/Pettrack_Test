pipeline {
    agent any

    environment {
        LOCATION_IMAGE = 'it66070178/location:latest'
        PET_IMAGE      = 'it66070178/pet:latest'
        USER_IMAGE     = 'it66070178/user:latest'
        FRONTEND_IMAGE = 'it66070178/frontend:latest'
        DOCKER_CREDENTIALS = credentials('dockerhub')
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
                dir('./user-service') { sh 'docker build -t $USER_IMAGE . --no-cache' }
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
                sh '''
                echo "Stopping and removing old pettrack containers..."
                docker ps -a -q --filter "name=pettrack-" | xargs -r docker rm -f
                '''
            }
        }
        
        stage('Deploy with Docker Compose') {
            steps {
                dir('.') {
                    echo "--- FORCE CLEANUP BEFORE DEPLOY ---"

                    sh 'docker rm -f pettrack_node_exporter || true'
                    sh 'docker rm -f pettrack_nginx_exporter || true'
                    sh 'docker rm -f pettrack_prometheus || true'
                    sh 'docker rm -f pettrack_grafana || true'

                    sh 'docker compose down -v --remove-orphans || true' 
        
                    echo "--- STARTING FRESH DEPLOY ---"
ฃ
                    sh 'docker compose up -d' 
ฃ
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
