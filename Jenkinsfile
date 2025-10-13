pipeline {
    agent any

    stages {
        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker-compose build'
                }
            }
        }
        stage('Run Docker Containers') {
            steps {
                script {
                    sh 'docker-compose up -d'
                }
            }
        }
        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }
    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}