
pipeline {
    agent any

    environment {
        AWS_REGION = 'ap-southeast-2'
        AWS_ACCOUNT_ID = '977468846243'
        ECR_REGISTRY = '977468846243.dkr.ecr.ap-southeast-2.amazonaws.com'

        BACKEND_REPO = 'todo-backend'
        FRONTEND_REPO = 'todo-frontend'

        ECS_CLUSTER = 'todo-cluster'
        BACKEND_SERVICE = 'todo-backend-service'
        FRONTEND_SERVICE = 'todo-frontend-service'

        BACKEND_TASK_FAMILY = 'todo-backend-task'
        FRONTEND_TASK_FAMILY = 'todo-frontend-task'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/vamshi99x/todo-react-express-postgres.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e
                    docker build -f backend/Dockerfile \
                        -t todo-backend:${BUILD_NUMBER} .

                    docker build --build-arg DEPLOY_ENV=aws \
                        -f frontend/Dockerfile \
                        -t todo-frontend:${BUILD_NUMBER} .
                '''
            }
        }

        stage('Authenticate with ECR') {
            steps {
                sh '''
                    set -e
                    aws ecr get-login-password --region $AWS_REGION |
                    docker login --username AWS --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Push Images to ECR') {
            steps {
                sh '''
                    set -e
                    docker tag todo-backend:${BUILD_NUMBER} \
                        $ECR_REGISTRY/$BACKEND_REPO:${BUILD_NUMBER}

                    docker tag todo-frontend:${BUILD_NUMBER} \
                        $ECR_REGISTRY/$FRONTEND_REPO:${BUILD_NUMBER}

                    docker push $ECR_REGISTRY/$BACKEND_REPO:${BUILD_NUMBER}
                    docker push $ECR_REGISTRY/$FRONTEND_REPO:${BUILD_NUMBER}
                '''
            }
        }

        stage('Register ECS Task Definitions') {
            steps {
                sh '''
                    set -e

                    aws ecs describe-task-definition \
                        --task-definition $BACKEND_TASK_FAMILY \
                        --region $AWS_REGION \
                        --query taskDefinition > backend-task.json

                    aws ecs describe-task-definition \
                        --task-definition $FRONTEND_TASK_FAMILY \
                        --region $AWS_REGION \
                        --query taskDefinition > frontend-task.json

                    jq --arg IMAGE "$ECR_REGISTRY/$BACKEND_REPO:${BUILD_NUMBER}" \
                       'if any(.containerDefinitions[]; .name == "todo-backend")
                        then (.containerDefinitions |= map(
                            if .name == "todo-backend" then .image = $IMAGE else . end))
                        else error("Backend container not found")
                        end
                        | del(.taskDefinitionArn, .revision, .status,
                              .requiresAttributes, .compatibilities,
                              .registeredAt, .registeredBy, .deregisteredAt)' \
                       backend-task.json > backend-task-new.json

                    jq --arg IMAGE "$ECR_REGISTRY/$FRONTEND_REPO:${BUILD_NUMBER}" \
                       'if any(.containerDefinitions[]; .name == "todo-frontend")
                        then (.containerDefinitions |= map(
                            if .name == "todo-frontend" then .image = $IMAGE else . end))
                        else error("Frontend container not found")
                        end
                        | del(.taskDefinitionArn, .revision, .status,
                              .requiresAttributes, .compatibilities,
                              .registeredAt, .registeredBy, .deregisteredAt)' \
                       frontend-task.json > frontend-task-new.json

                    aws ecs register-task-definition \
                        --cli-input-json file://backend-task-new.json \
                        --region $AWS_REGION \
                        --query taskDefinition.taskDefinitionArn \
                        --output text > backend-task-arn.txt

                    aws ecs register-task-definition \
                        --cli-input-json file://frontend-task-new.json \
                        --region $AWS_REGION \
                        --query taskDefinition.taskDefinitionArn \
                        --output text > frontend-task-arn.txt
                '''
            }
        }

        stage('Deploy to ECS') {
            steps {
                sh '''
                    set -e

                    BACKEND_TASK_ARN=$(cat backend-task-arn.txt)
                    FRONTEND_TASK_ARN=$(cat frontend-task-arn.txt)

                    aws ecs update-service \
                        --cluster $ECS_CLUSTER \
                        --service $BACKEND_SERVICE \
                        --task-definition "$BACKEND_TASK_ARN" \
                        --region $AWS_REGION

                    aws ecs update-service \
                        --cluster $ECS_CLUSTER \
                        --service $FRONTEND_SERVICE \
                        --task-definition "$FRONTEND_TASK_ARN" \
                        --region $AWS_REGION
                '''
            }
        }

        stage('Wait for ECS Stability') {
            steps {
                sh '''
                    aws ecs wait services-stable \
                        --cluster $ECS_CLUSTER \
                        --services $BACKEND_SERVICE $FRONTEND_SERVICE \
                        --region $AWS_REGION
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    aws ecs describe-services \
                        --cluster $ECS_CLUSTER \
                        --services $BACKEND_SERVICE $FRONTEND_SERVICE \
                        --region $AWS_REGION \
                        --query 'services[*].[serviceName,status,taskDefinition,runningCount]' \
                        --output table
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Todo application deployed to ECS!'
        }
        failure {
            echo 'FAILED: Check Jenkins Console Output.'
        }
    }
}
