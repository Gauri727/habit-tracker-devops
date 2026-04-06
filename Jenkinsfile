pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
               git branch: 'main', url: 'https://github.com/Gauri727/habit-tracker-devops.git'
            }
        }

        stage('Build') {
            steps {
                echo "Build stage - validating files"
                bat 'dir'
            }
        }

        stage('Test') {
    steps {
        echo "Running Selenium Test"
        bat 'python test.py'
          }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t habit-app .'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker run -d -p 8082:80 habit-app'
            }
        }
    }
}
