/* eslint-disable array-callback-return */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import {
  pilihSoal,
  pilihJawaban,
  endTime
} from "../../redux/actions/contentActions";
import Content from "../../components/content/Content";
import { dataSoal } from "../../data/test";
import moment from "moment";

class ContentContainer extends Component {
  constructor() {
    super();
    this.state = {
      checked: "",
      result: false,
      completedAnswer: false,
      hari: null,
      jam: null,
      menit: null,
      detik: null
    };
    this.onChangeChoices = this.onChangeChoices.bind(this);
    this.onClickSoal = this.onClickSoal.bind(this);
    this.onClickSidebar = this.onClickSidebar.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    // mengambil data soal berdasarkan id routes params
    dataSoal.map((item, idx) => {
      const index = idx + 1;
      if (index === parseInt(id)) {
        this.props.pilihSoal(item);
      }
    });
    this.timer = setInterval(this.showRemaining.bind(this), 1000);
  }

  //clearing interval
  componentWillUnmount() {
    return clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    //mengisi jawaban di setiap soal dan mengupdate ke state
    const { id } = this.props.match.params;
    const { answer } = this.props.content;
    if (id !== prevProps.match.params.id) {
      return answer.map((item, idx) => {
        if (item.soal === parseInt(id)) {
          this.setState({ checked: item.value });
        } else if (item.soal < parseInt(id)) {
          this.setState({ checked: "" });
        }
      });
    }
  }

  //fungsi menghitung mundur waktu
  showRemaining() {
    const { time } = this.props.content;
    var now = new Date();
    var distance = time.end - now;
    if (distance < 0) {
      clearInterval(this.timer);
      this.setState({ result: true });
      this.props.endTime(time.end);
    }
    var hari = Math.floor(distance / time._hari);
    var jam = Math.floor((distance % time._hari) / time._jam);
    var menit = Math.floor((distance % time._jam) / time._menit);
    var detik = Math.floor((distance % time._menit) / time._detik);
    this.setState({
      hari,
      jam,
      menit,
      detik
    });
  }

  //fungsi mengubah jawaban di radio button
  onChangeChoices(e) {
    this.setState({
      checked: e
    });
  }

  onClickSoal() {
    this.pilihSoal();
    this.pilihJawaban();
  }

  //fungsi untuk mengirim soal ke pages berikutnya
  pilihSoal() {
    const { id } = this.props.match.params;
    const page = parseInt(id);
    return dataSoal.map((item, idx) => {
      const index = idx;
      // membandingkan id routes params dengan index
      if (index === page) {
        this.props.pilihSoal(item);
      }
    });
  }

  //fungsi mengirim jawaban ke redux
  pilihJawaban() {
    const { id } = this.props.match.params;
    const endTime = new Date();
    const page = parseInt(id);
    return dataSoal.map((item, idx) => {
      const index = idx + 1;
      if (index === page) {
        this.props.pilihJawaban({
          ...item,
          value: this.state.checked
        });
        if (page === dataSoal.length) {
          this.setState({ result: true });
          this.props.endTime(moment(endTime).format());
        }
      }
    });
  }

  //fungsi memilih soal berdasarkan nomor kotak
  onClickSidebar(item) {
    this.props.pilihSoal(item);
  }

  render() {
    const { id } = this.props.match.params;
    const { data, answer } = this.props.content;
    const { checked, result, jam, menit, detik } = this.state;
    const page = parseInt(id) + 1;
    const checkedPage = parseInt(id);
    if (result) {
      return <Redirect to="/result" />;
    }
    return (
      <Content
        nomor={data.soal}
        pertanyaan={data.pertanyaan}
        pilihan={data.pilihan}
        checked={checked}
        onChangeChoices={e => this.onChangeChoices(e)}
        to={`/${page}`}
        onClickSoal={this.onClickSoal}
        data={answer}
        onClickSidebar={item => this.onClickSidebar(item)}
        page={checkedPage}
        jam={jam}
        menit={menit}
        detik={detik}
      />
    );
  }
}

const mapStateToProps = state => ({
  content: state.content
});

export default connect(
  mapStateToProps,
  { pilihSoal, pilihJawaban, endTime }
)(ContentContainer);