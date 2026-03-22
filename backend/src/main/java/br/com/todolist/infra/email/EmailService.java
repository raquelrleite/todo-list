package br.com.todolist.infra.email;

import br.com.todolist.enums.EmailType;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.ITemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final ITemplateEngine templateEngine;

    @Value("${MAIL_USERNAME}")
    private String from;

    @Async
    public void sendEmail(String to, EmailType type, Map<String, Object> variables) {
        try {
            log.info("Sending email to {} with subject '{}'", to, type.getSubject());
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(type.getSubject());
            helper.setText(buildBody(type.getTemplate(), variables), true);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Error sending email to {} [subject: '{}']: {}", to, type.getSubject(), e.getMessage());
        }
    }

    private String buildBody(String template, Map<String, Object> variables) {
        Context context = new Context();
        context.setVariables(variables);
        return templateEngine.process("email/" + template, context);
    }
}