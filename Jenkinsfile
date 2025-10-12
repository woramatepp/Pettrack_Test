pipeline {
    agent any

    environment {
        LOCATION_IMAGE = 'it66070178/location:latest'
        PET_IMAGE      = 'it66070178/pet:latest'
        USER_IMAGE     = 'it66070178/user:latest'
        FRONTEND_IMAGE = 'it66070178/frontend:latest'
        DOCKER_CREDENTIALS = credentials('dockerhub')
        STACK_NAME = 'pettrack'
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

        stage('Init Docker Swarm') {
            steps {
                script {

                    sh 'docker info | grep "Swarm: active" || docker swarm init'
                }
            }
        }

        stage('Deploy with Docker Swarm Stack') {
            steps {
                dir('.') {

                    sh 'docker stack rm $STACK_NAME || true'

                    sh 'docker stack deploy -c docker-compose.yml $STACK_NAME'
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
