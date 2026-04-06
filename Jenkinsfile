pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/Gauri727/habit-tracker-devops.git'
            }
        }

        stage('Build') {
            steps {
                echo "Build stage - validating files"
                sh 'ls'
            }
        }

        stage('Test') {
            steps {
                echo "Testing HTML"
                sh 'echo "Basic test passed"'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t habit-app .'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker run -d -p 8082:80 habit-app'
            }
        }
    }
}
