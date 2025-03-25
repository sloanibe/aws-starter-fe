package com.example.emailservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.name:login-exchange}")
    private String exchangeName;

    @Value("${rabbitmq.queue.name:login-queue}")
    private String queueName;

    @Value("${rabbitmq.routing.key:login.event}")
    private String routingKey;

    @Bean
    public TopicExchange loginExchange() {
        return ExchangeBuilder
                .topicExchange(exchangeName)
                .durable(true)
                .build();
    }

    @Bean
    public Queue loginQueue() {
        return QueueBuilder
                .durable(queueName)
                .build();
    }

    @Bean
    public Binding loginBinding(Queue loginQueue, TopicExchange loginExchange) {
        return BindingBuilder
                .bind(loginQueue)
                .to(loginExchange)
                .with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
