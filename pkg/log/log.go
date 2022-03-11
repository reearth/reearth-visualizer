package log

import (
	"os"

	"github.com/sirupsen/logrus"
)

func init() {
	gcp, _ := os.LookupEnv("GOOGLE_CLOUD_PROJECT")
	logrus.SetLevel(logrus.InfoLevel)
	if gcp != "" {
		logrus.SetFormatter(NewGCEFormatter(false))
	} else {
		logrus.SetFormatter(&logrus.TextFormatter{
			DisableColors: false,
			FullTimestamp: true,
		})
	}
}

func Tracef(format string, args ...interface{}) {
	logrus.Tracef(format, args...)
}

func Debugf(format string, args ...interface{}) {
	logrus.Debugf(format, args...)
}

func Infof(format string, args ...interface{}) {
	logrus.Infof(format, args...)
}

func Printf(format string, args ...interface{}) {
	logrus.Printf(format, args...)
}

func Warnf(format string, args ...interface{}) {
	logrus.Warnf(format, args...)
}

func Errorf(format string, args ...interface{}) {
	logrus.Errorf(format, args...)
}

func Fatalf(format string, args ...interface{}) {
	logrus.Fatalf(format, args...)
}

func Trace(args ...interface{}) {
	logrus.Trace(args...)
}

func Debug(args ...interface{}) {
	logrus.Debug(args...)
}

func Info(args ...interface{}) {
	logrus.Info(args...)
}

func Print(args ...interface{}) {
	logrus.Print(args...)
}

func Warn(args ...interface{}) {
	logrus.Warn(args...)
}

func Error(args ...interface{}) {
	logrus.Error(args...)
}

func Fatal(args ...interface{}) {
	logrus.Fatal(args...)
}

func Traceln(args ...interface{}) {
	logrus.Traceln(args...)
}

func Debugln(args ...interface{}) {
	logrus.Debugln(args...)
}

func Infoln(args ...interface{}) {
	logrus.Infoln(args...)
}

func Println(args ...interface{}) {
	logrus.Println(args...)
}

func Warnln(args ...interface{}) {
	logrus.Warnln(args...)
}

func Errorln(args ...interface{}) {
	logrus.Errorln(args...)
}

func Fatalln(args ...interface{}) {
	logrus.Fatalln(args...)
}

func Panicf(format string, args ...interface{}) {
	logrus.Panicf(format, args...)
}
